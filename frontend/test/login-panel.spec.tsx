import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginPanel } from "../components/login-panel";

describe("LoginPanel", () => {
  it("submits typed credentials", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(<LoginPanel loading={false} onSubmit={onSubmit} />);

    await user.clear(screen.getByLabelText("Username"));
    await user.type(screen.getByLabelText("Username"), "demo");
    await user.clear(screen.getByLabelText("Password"));
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(onSubmit).toHaveBeenCalledWith("demo", "secret");
  });
});
