import React, { type ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const mainStyle: React.CSSProperties = {
        padding: '20px 30px',
        backgroundColor: '#f4f7f9',
        minHeight: 'calc(100vh - 60px)', 
    };

    return (
        <div>
            <Header />
            <main style={mainStyle}>
                {children}
            </main>
        </div>
    );
};

export default Layout;