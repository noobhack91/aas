import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    roles: {  
      type: DataTypes.ARRAY(DataTypes.STRING), // Store multiple roles  
      defaultValue: ['user'] // Default role is 'user'  
      }, 
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'users',
    underscored: true,
    timestamps: true
  });
  User.prototype.comparePassword = async function(candidatePassword) {  
      return bcrypt.compare(candidatePassword, this.password);  
    };  
  return User;
};