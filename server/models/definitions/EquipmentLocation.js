import { DataTypes, Model } from 'sequelize';

class EquipmentLocation extends Model {
  static init(sequelize) {
    super.init({
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      installationId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      srNo: {
        type: DataTypes.STRING,
        allowNull: false
      },
      districtName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      blockName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      facilityName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('Pending', 'In Progress', 'Completed'),
        defaultValue: 'Pending'
      }
    }, {
      sequelize,
      modelName: 'EquipmentLocation',
      tableName: 'equipment_locations',
      underscored: true,
      timestamps: true
    });
  }

  static associate(models) {
    this.belongsTo(models.EquipmentInstallation, {
      foreignKey: 'installationId',
      as: 'installation'
    });
  }
}

export default EquipmentLocation;