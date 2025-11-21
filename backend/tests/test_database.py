import pytest
from app.database import db_manager

def test_get_database_raises_before_connect():
    """
    Description: Guard — calling get_database before connect should raise.
    Input: db_manager.get_database()
    Output: RuntimeError
    """
    with pytest.raises(RuntimeError):
        db_manager.get_database()
