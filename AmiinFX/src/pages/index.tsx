import React from 'react';
import PaymentForm from '../components/PaymentForm';

const HomePage = () => {
    return (
        <div>
            <h1>Welcome to AmiinFX</h1>
            <p>Select a payment option below:</p>
            <PaymentForm />
        </div>
    );
};

export default HomePage;