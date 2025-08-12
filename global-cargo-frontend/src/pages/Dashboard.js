import React, { useEffect, useState } from 'react';
import { fetchShips } from '../api/ships';
import { fetchShipments } from '../api/shipments';
import { fetchClients } from '../api/clients';

const Dashboard = () => {
  const [activeShipsCount, setActiveShipsCount] = useState(0);
  const [shipmentsInTransitCount, setShipmentsInTransitCount] = useState(0);
  const [activeClientsCount, setActiveClientsCount] = useState(0);

  useEffect(() => {
    // Active Ships
    fetchShips().then((res) => {
      const activeShips = res.data.filter((ship) => ship.is_active === true);
      setActiveShipsCount(activeShips.length);
    });

    // Shipments in Transit
    fetchShipments().then((res) => {
      const inTransit = res.data.filter((shipment) => shipment.status === 'in_transit');
      setShipmentsInTransitCount(inTransit.length);
    });

    // Active Clients
    fetchClients().then((res) => {
      const activeClients = res.data.filter((client) => client.is_active === true);
      setActiveClientsCount(activeClients.length);
    });
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ padding: '20px', background: '#eee', borderRadius: '8px' }}>
          <h3>Active Ships</h3>
          <p>{activeShipsCount}</p>
        </div>
        <div style={{ padding: '20px', background: '#eee', borderRadius: '8px' }}>
          <h3>Shipments in Transit</h3>
          <p>{shipmentsInTransitCount}</p>
        </div>
        <div style={{ padding: '20px', background: '#eee', borderRadius: '8px' }}>
          <h3>Active Clients</h3>
          <p>{activeClientsCount}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
