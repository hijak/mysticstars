const express = require('express');
const { Reading } = require('../models/Reading');
const { Op } = require('sequelize');

const router = express.Router();

// Zodiac signs validation
const ZODIAC_SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
];

const READING_TYPES = ['daily', 'weekly', 'monthly', 'yearly', 'love', 'career', 'health'];

// Complete reading types to fetch together
const COMPLETE_READING_TYPES = ['daily', 'love', 'career', 'health'];

// Middleware to validate zodiac sign
const validateZodiacSign = (req, res, next) => {
  const { sign } = req.params;
  if (!sign || !ZODIAC_SIGNS.includes(sign.toLowerCase())) {
    return res.status(400).json({
      error: 'Invalid zodiac sign',
      validSigns: ZODIAC_SIGNS
    });
  }
  req.params.sign = sign.toLowerCase();
  next();
};

// Middleware to validate reading type
const validateReadingType = (req, res, next) => {
  const { type } = req.params;
  if (!type || !READING_TYPES.includes(type.toLowerCase())) {
    return res.status(400).json({
      error: 'Invalid reading type',
      validTypes: READING_TYPES
    });
  }
  req.params.type = type.toLowerCase();
  next();
};

// GET /api/readings/status - API status and statistics
router.get('/status', async (req, res) => {
  try {
    const now = new Date();

    // Get counts for each reading type
    const stats = {};

    for (const type of READING_TYPES) {
      stats[type] = {
        total: await Reading.count({ where: { readingType: type } }),
        active: await Reading.count({
          where: {
            readingType: type,
            isActive: true,
            validFrom: { [Op.lte]: now },
            validUntil: { [Op.gte]: now }
          }
        })
      };
    }

    // Get last generation time
    const lastGenerated = await Reading.findOne({
      attributes: ['dateGenerated'],
      order: [['dateGenerated', 'DESC']]
    });

    res.json({
      status: 'operational',
      timestamp: now.toISOString(),
      statistics: stats,
      lastGenerated: lastGenerated?.dateGenerated || null,
      totalReadings: await Reading.count(),
      activeReadings: await Reading.count({
        where: {
          isActive: true,
          validFrom: { [Op.lte]: now },
          validUntil: { [Op.gte]: now }
        }
      })
    });
  } catch (error) {
    console.error('Status endpoint error:', error);
    res.status(500).json({
      error: 'Unable to retrieve status',
      message: error.message
    });
  }
});

// GET /api/readings/:sign/complete - Get complete horoscope with daily, love, career, health readings and lucky influences
router.get('/:sign/complete', validateZodiacSign, async (req, res) => {
  try {
    const { sign } = req.params;
    const now = new Date();

    // Fetch all required reading types
    const readings = {};
    const errors = [];

    for (const type of COMPLETE_READING_TYPES) {
      try {
        const reading = await Reading.getCurrentReading(sign, type);
        if (reading) {
          readings[type] = reading;
        } else {
          errors.push(`${type} reading not available`);
        }
      } catch (error) {
        errors.push(`${type} reading error: ${error.message}`);
      }
    }

    // Check if we have at least the daily reading
    if (!readings.daily) {
      return res.status(404).json({
        error: 'No current daily reading found',
        sign,
        message: `No active daily reading available for ${sign}. Please try again later.`,
        errors
      });
    }

    // Extract lucky influences from daily reading
    const luckyInfluences = readings.daily.luckyInfluences || {
      number: null,
      color: null,
      time: null
    };

    // Format response
    const data = {
      daily: readings.daily.content || null,
      love: readings.love?.content || null,
      career: readings.career?.content || null,
      health: readings.health?.content || null,
      lucky: luckyInfluences
    };

    res.json({
      success: true,
      zodiacSign: sign,
      data,
      validFrom: readings.daily.validFrom,
      validUntil: readings.daily.validUntil,
      generatedAt: readings.daily.dateGenerated,
      warnings: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error(`Error fetching complete readings for ${sign}:`, error);
    res.status(500).json({
      error: 'Unable to fetch complete readings',
      message: error.message
    });
  }
});

// GET /api/readings/:sign/:type - Get specific reading
router.get('/:sign/:type', validateZodiacSign, validateReadingType, async (req, res) => {
  try {
    const { sign, type } = req.params;

    const reading = await Reading.getCurrentReading(sign, type);

    if (!reading) {
      return res.status(404).json({
        error: 'No current reading found',
        sign,
        type,
        message: `No active ${type} reading available for ${sign}. Please try again later.`
      });
    }

    res.json({
      success: true,
      data: {
        zodiacSign: reading.zodiacSign,
        readingType: reading.readingType,
        content: reading.content,
        validFrom: reading.validFrom,
        validUntil: reading.validUntil,
        generatedAt: reading.dateGenerated,
        isCurrentlyValid: reading.isCurrentlyValid
      }
    });
  } catch (error) {
    console.error(`Error fetching ${type} reading for ${sign}:`, error);
    res.status(500).json({
      error: 'Unable to fetch reading',
      message: error.message
    });
  }
});

// GET /api/readings/:sign - Get all current readings for a zodiac sign
router.get('/:sign', validateZodiacSign, async (req, res) => {
  try {
    const { sign } = req.params;

    const readings = await Reading.getAllCurrentReadings(sign);

    if (Object.keys(readings).length === 0) {
      return res.status(404).json({
        error: 'No current readings found',
        sign,
        message: `No active readings available for ${sign}. Please try again later.`
      });
    }

    // Format response
    const formattedReadings = {};
    for (const [type, reading] of Object.entries(readings)) {
      formattedReadings[type] = {
        content: reading.content,
        validFrom: reading.validFrom,
        validUntil: reading.validUntil,
        generatedAt: reading.dateGenerated,
        isCurrentlyValid: reading.isCurrentlyValid
      };
    }

    res.json({
      success: true,
      zodiacSign: sign,
      data: formattedReadings,
      availableTypes: Object.keys(formattedReadings)
    });
  } catch (error) {
    console.error(`Error fetching all readings for ${sign}:`, error);
    res.status(500).json({
      error: 'Unable to fetch readings',
      message: error.message
    });
  }
});


// POST /api/readings - Create/update a reading (used by cronjobs)
router.post('/', async (req, res) => {
  try {
    const { zodiacSign, readingType, content, validFrom, validUntil, generationMetadata, luckyInfluences } = req.body;

    // Validation
    if (!zodiacSign || !ZODIAC_SIGNS.includes(zodiacSign.toLowerCase())) {
      return res.status(400).json({
        error: 'Invalid or missing zodiac sign',
        validSigns: ZODIAC_SIGNS
      });
    }

    if (!readingType || !READING_TYPES.includes(readingType.toLowerCase())) {
      return res.status(400).json({
        error: 'Invalid or missing reading type',
        validTypes: READING_TYPES
      });
    }

    if (!content || content.length < 50) {
      return res.status(400).json({
        error: 'Content is required and must be at least 50 characters'
      });
    }

    // Create new reading atomically and only then deactivate previous ones
    // This prevents gaps if creation fails after deactivation
    const { getSequelize } = require('../config/database');
    const sequelize = getSequelize();
    if (!sequelize) {
      return res.status(503).json({ error: 'Database not connected' });
    }

    const reading = await sequelize.transaction(async (t) => {
      // Create new reading - only include validFrom/validUntil if they're provided
      const readingData = {
        zodiacSign: zodiacSign.toLowerCase(),
        readingType: readingType.toLowerCase(),
        content,
        generationMetadata,
        luckyInfluences
      };

      if (validFrom) readingData.validFrom = new Date(validFrom);
      if (validUntil) readingData.validUntil = new Date(validUntil);

      const created = await Reading.create(readingData, { transaction: t });

      // Deactivate previous readings of the same type for this sign, except the new one
      await Reading.update(
        { isActive: false },
        {
          where: {
            zodiacSign: created.zodiacSign,
            readingType: created.readingType,
            id: { [require('sequelize').Op.ne]: created.id }
          },
          transaction: t
        }
      );

      return created;
    });

    res.status(201).json({
      success: true,
      message: 'Reading created successfully',
      data: {
        id: reading.id,
        zodiacSign: reading.zodiacSign,
        readingType: reading.readingType,
        validFrom: reading.validFrom,
        validUntil: reading.validUntil,
        generatedAt: reading.dateGenerated
      }
    });
  } catch (error) {
    console.error('Error creating reading:', error);
    res.status(500).json({
      error: 'Unable to create reading',
      message: error.message
    });
  }
});

module.exports = router;
