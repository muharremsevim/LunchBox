import { render, screen, fireEvent } from '@testing-library/react';
import OrderPage from '../src/app/order/[date]/page';
import '@testing-library/jest-dom';

describe('OrderPage', () => {
  it('renders menu and form', () => {
    render(<OrderPage params={{ date: '2025-07-15' }} />);
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Order for 2025-07-15')).toBeInTheDocument();
    expect(screen.getByText('Select food type')).toBeInTheDocument();
    expect(screen.getByText('Select bread')).toBeInTheDocument();
    expect(screen.getByText('Select drink')).toBeInTheDocument();
  });
  it('enables order button only after lunch type is selected', () => {
    render(<OrderPage params={{ date: '2025-07-15' }} />);
    const orderBtn = screen.getByRole('button', { name: /order/i });
    expect(orderBtn).toBeDisabled();
    fireEvent.change(screen.getByDisplayValue('Select food type'), { target: { value: 'Diet' } });
    expect(orderBtn).not.toBeDisabled();
  });
  it('shows sandwich options if Sandwich is selected', () => {
    render(<OrderPage params={{ date: '2025-07-15' }} />);
    fireEvent.change(screen.getByDisplayValue('Select food type'), { target: { value: 'Cold' } });
    expect(screen.getByText('Select sandwich')).toBeInTheDocument();
  });
  it('does not show sandwich options for Diet', () => {
    render(<OrderPage params={{ date: '2025-07-15' }} />);
    fireEvent.change(screen.getByDisplayValue('Select food type'), { target: { value: 'Diet' } });
    expect(screen.queryByText('Select sandwich')).not.toBeInTheDocument();
  });
}); 