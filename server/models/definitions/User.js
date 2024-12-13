import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    roles: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['user'],
      get() {
        // Ensure we always return an array
        const rawValue = this.getDataValue('roles');
        return Array.isArray(rawValue) ? rawValue : [rawValue].filter(Boolean);
      },
      set(value) {
        // Ensure we always store an array
        this.setDataValue('roles', 
          Array.isArray(value) ? value : [value].filter(Boolean)
        );
      },
      validate: {
        isValidRole(value) {
          const validRoles = ['admin', 'logistics_manager', 'installer', 'finance_manager', 'tender_manager'];
          const roles = Array.isArray(value) ? value : [value].filter(Boolean);
          roles.forEach(role => {
            if (!validRoles.includes(role)) {
              throw new Error(`Invalid role: ${role}`);
            }
          });
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  // Instance methods
  User.prototype.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  User.prototype.hasRole = function(role) {
    return this.roles.includes(role);
  };

  User.prototype.hasAnyRole = function(roles) {
    return this.roles.some(role => roles.includes(role));
  };

  User.prototype.generateAuthToken = function() {
    // Map backend roles to frontend roles
    const roleMapping = {
      'admin': 'admin',
      'logistics_manager': 'logistics',
      'installer': 'installation',
      'finance_manager': 'invoice',
      'tender_manager': 'tender'
    };

    // Ensure roles is an array and map it
    const roles = Array.isArray(this.roles) ? this.roles : [this.roles].filter(Boolean);
    const frontendRoles = roles.map(role => roleMapping[role] || role);

    return jwt.sign(
      { 
        id: this.id,
        username: this.username,
        email: this.email,
        roles: frontendRoles
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  };

  User.prototype.toAuthJSON = function() {
    // Map backend roles to frontend roles
    const roleMapping = {
      'admin': 'admin',
      'logistics_manager': 'logistics',
      'installer': 'installation',
      'finance_manager': 'invoice',
      'tender_manager': 'tender'
    };

    // Ensure roles is an array and map it
    const roles = Array.isArray(this.roles) ? this.roles : [this.roles].filter(Boolean);
    const frontendRoles = roles.map(role => roleMapping[role] || role);

    return {
      id: this.id,
      username: this.username,
      email: this.email,
      roles: frontendRoles
    };
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  return User;
};