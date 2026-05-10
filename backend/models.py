from sqlalchemy import Column, Integer, String
from database import Base

class EmergencyAlert(Base):
    __tablename__ = "emergency_alerts"

    id = Column(Integer, primary_key=True)
    title = Column(String)
    severity = Column(String)
    location = Column(String)
    
class CityMetrics(Base):
    __tablename__ = "city_metrics"

    id = Column(
        Integer,
        primary_key=True
    )

    co2_reduced = Column(Integer)

    traffic_reduction = Column(
        Integer
    )

    emergency_access = Column(
        Integer
    )

    transit_efficiency = Column(
        Integer
    )