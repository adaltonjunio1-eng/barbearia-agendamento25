import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import './styles/globals.css';
import './styles/layout.css';

const App = () => {
  return (
    <Router>
      <div>
        <Header />
        <Switch>
          <Route path="/" exact component={Home} />
          {/* Adicione outras rotas aqui */}
        </Switch>
        <Footer />
      </div>
    </Router>
  );
};

export default App;