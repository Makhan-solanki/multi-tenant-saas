// src/index.js
// This is the entry point for Module Federation.
// It exposes the components defined in webpack.config.js (or vite.config.js for Vite Federation)
import App from './App';
import { TicketList } from './components/TicketList';
import { TicketForm } from './components/TicketForm';

export default App;
export { TicketList, TicketForm };