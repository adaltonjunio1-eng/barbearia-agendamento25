import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer>
            <p>&copy; {new Date().getFullYear()} Meu Projeto Visual. Todos os direitos reservados.</p>
            <nav>
                <ul>
                    <li><a href="/sobre">Sobre</a></li>
                    <li><a href="/contato">Contato</a></li>
                </ul>
            </nav>
        </footer>
    );
};

export default Footer;