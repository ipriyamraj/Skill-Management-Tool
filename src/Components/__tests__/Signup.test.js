import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Signup from '../Signup';

test('should render the Signup component', async () => {
  render(<Signup />);
  const signUpButton = screen.getByText('Submit');
  
  // Trigger form submission
  fireEvent.click(signUpButton);

  // Wait for asynchronous operation to complete
  await waitFor(() => {
    // Assertions after asynchronous operation
    const signUpElement = screen.getByTestId("pa");
    expect(signUpElement).toBeInTheDocument();
  });
});
