import React from 'react';

const Header: React.FC = () => {
    return (
        <header>
            <h1>Meu Projeto Visual</h1>
            <nav>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/about">Sobre</a></li>
                    <li><a href="/contact">Contato</a></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;