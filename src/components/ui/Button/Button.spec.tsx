// ⚠️ This is a conscious implementation test:
// We're testing if the button has the correct classes based on props.
// Testing Library recommends avoiding this type of test,
// but in this case, the behavior *is* visual.
// Therefore, this test is necessary and justified.

import { render, screen } from "@testing-library/react";
import { Button } from ".";


describe('<Button />', () => {
  describe('default props and JSX', () => {
    test('should render the button with default props (only with children)', async () => {
        const r = render(<Button> Test </Button>);
        // r.debug();
        const button = screen.getByRole('button', {name: /test/i} ) 
      // expect(button).toMatchSnapshot();
    });
    // test('verify if default JSX properties work correctly', async () => {});
  });
  // describe('variants (colors)', () => {
  //   test('check if default applies the correct color', async () => {});
  //   test('check if danger applies the correct color', async () => {});
  //   test('check if ghost applies the correct color', async () => {});
  // });
  // describe('size (sizes)', () => {
  //   test('sm size should be smaller', async () => {});
  //   test('md size should be medium', async () => {});
  //   test('lg size should be large', async () => {});
  // });
  // describe('disabled', () => {
  //   test('classes for disabled state are correct', async () => {});
  // });
});