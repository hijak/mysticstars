const { DataTypes, Model, Op } = require('sequelize');
const { connectDB } = require('../config/database');

class Reading extends Model {
  // Virtual for checking if reading is currently valid
  get isCurrentlyValid() {
    const now = new Date();
    return now >= this.validFrom && now <= this.validUntil && this.isActive;
  }

  // Static method to get current reading for a sign and type
  static async getCurrentReading(zodiacSign, readingType) {
    const now = new Date();
    return this.findOne({
      where: {
        zodiacSign: zodiacSign.toLowerCase(),
        readingType: readingType.toLowerCase(),
        validFrom: { [Op.lte]: now },
        validUntil: { [Op.gte]: now },
        isActive: true
      },
      order: [['dateGenerated', 'DESC']]
    });
  }

  // Static method to get all current readings for a zodiac sign
  static async getAllCurrentReadings(zodiacSign) {
    const now = new Date();
    const readings = {};
    
    const results = await this.findAll({
      where: {
        zodiacSign: zodiacSign.toLowerCase(),
        validFrom: { [Op.lte]: now },
        validUntil: { [Op.gte]: now },
        isActive: true
      },
      order: [['readingType', 'ASC'], ['dateGenerated', 'DESC']]
    });

    // Group by reading type, taking the most recent for each type
    for (const reading of results) {
      if (!readings[reading.readingType]) {
        readings[reading.readingType] = reading;
      }
    }

    return readings;
  }

  // Instance method to calculate validity period based on reading type
  setValidityPeriod(startDate = new Date()) {
    console.log(`[DEBUG] setValidityPeriod called with readingType: ${this.readingType}, startDate: ${startDate}`);
    
    const start = new Date(startDate);
    let end = new Date(start);

    switch (this.readingType) {
      case 'daily':
        // Valid until end of next day to allow for timezone differences
        end.setDate(start.getDate() + 2);
        end.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        // Valid for 8 days to allow overlap
        end.setDate(start.getDate() + 8);
        break;
      case 'monthly':
        // Valid for next month plus a few days buffer
        end.setMonth(start.getMonth() + 1);
        end.setDate(end.getDate() + 3);
        break;
      case 'yearly':
        // Valid for next year plus a week buffer
        end.setFullYear(start.getFullYear() + 1);
        end.setDate(end.getDate() + 7);
        break;
      default:
        console.warn(`[WARN] Unknown reading type: ${this.readingType}, defaulting to daily`);
        end.setDate(start.getDate() + 2);
        end.setHours(0, 0, 0, 0);
    }

    this.validFrom = start;
    this.validUntil = end;
    
    console.log(`[DEBUG] setValidityPeriod result - validFrom: ${this.validFrom}, validUntil: ${this.validUntil}`);
  }
}

// Initialize the model
const initReading = async (sequelize) => {
  if (!sequelize) {
    sequelize = await connectDB();
  }
  
  Reading.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    zodiacSign: {
      type: DataTypes.ENUM(
        'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
        'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
      ),
      allowNull: false,
      set(value) {
        this.setDataValue('zodiacSign', value.toLowerCase());
      }
    },
    readingType: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
      allowNull: false,
      set(value) {
        this.setDataValue('readingType', value.toLowerCase());
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [50, 2000]
      }
    },
    dateGenerated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    validFrom: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    validUntil: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
      }
    },
    aiModel: {
      type: DataTypes.STRING,
      defaultValue: 'blackboxai/deepseek/deepseek-chat:free'
    },
    generationMetadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Reading',
    tableName: 'readings',
    timestamps: true,
    indexes: [
      {
        fields: ['zodiacSign', 'readingType', 'isActive']
      },
      {
        fields: ['validFrom', 'validUntil']
      },
      {
        fields: ['dateGenerated']
      },
      {
        fields: ['isActive']
      }
    ],
    hooks: {
      beforeValidate: async (reading) => {
        console.log(`[DEBUG] beforeValidate hook - readingType: ${reading.readingType}, validFrom: ${reading.validFrom}, validUntil: ${reading.validUntil}`);
        
        // Always set validity period based on reading type to override defaults
        console.log(`[DEBUG] Setting validity period for ${reading.readingType} reading`);
        try {
          reading.setValidityPeriod();
          console.log(`[DEBUG] After setValidityPeriod - validFrom: ${reading.validFrom}, validUntil: ${reading.validUntil}`);
        } catch (error) {
          console.error(`[ERROR] Failed to set validity period:`, error);
          // Set fallback values
          reading.validFrom = new Date();
          reading.validUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
          console.log(`[DEBUG] Set fallback values - validFrom: ${reading.validFrom}, validUntil: ${reading.validUntil}`);
        }
      },
      beforeCreate: async (reading) => {
        console.log(`[DEBUG] beforeCreate hook - readingType: ${reading.readingType}, validFrom: ${reading.validFrom}, validUntil: ${reading.validUntil}`);
        
        // Ensure validity period is set based on reading type
        console.log(`[DEBUG] Setting validity period in beforeCreate for ${reading.readingType} reading`);
        reading.setValidityPeriod();
      }
    }
  });

  // Ensure the table exists - use force: false to avoid dropping existing data
  try {
    await Reading.sync({ alter: true });
    console.log('📊 Readings table synced successfully');
  } catch (error) {
    console.error('❌ Error syncing Readings table:', error.message);
    // Try with just sync() without alter
    await Reading.sync();
    console.log('📊 Readings table created with basic sync');
  }

  return Reading;
};

module.exports = { Reading, initReading };