import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { LoginScreen } from "../components/login-screen";
import { loadStoredSession, saveStoredSession } from "../lib/auth-storage";
import { login } from "../lib/api";

jest.mock("../lib/api", () => ({
  login: jest.fn(),
}));

jest.mock("../lib/auth-storage", () => ({
  loadStoredSession: jest.fn(),
  saveStoredSession: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockedUseRouter = jest.mocked(useRouter);
const mockedLoadStoredSession = jest.mocked(loadStoredSession);
const mockedSaveStoredSession = jest.mocked(saveStoredSession);
const mockedLogin = jest.mocked(login);
const mockedReplace = jest.fn();

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseRouter.mockReturnValue({
      replace: mockedReplace,
    } as unknown as ReturnType<typeof useRouter>);
    mockedLoadStoredSession.mockReturnValue(null);
  });

  it("redirects to workspace when session already exists", async () => {
    mockedLoadStoredSession.mockReturnValue({
      accessToken: "token-1",
      user: {
        id: "user-1",
        username: "admin",
        role: "ADMIN",
      },
    });

    render(<LoginScreen />);

    await waitFor(() => {
      expect(mockedReplace).toHaveBeenCalledWith("/");
    });
  });

  it("logs in and redirects to workspace", async () => {
    const user = userEvent.setup();
    const session = {
      accessToken: "token-1",
      user: {
        id: "user-1",
        username: "admin",
        role: "ADMIN" as const,
      },
    };

    mockedLogin.mockResolvedValue(session);

    render(<LoginScreen />);

    await user.type(screen.getByLabelText("Username"), "admin");
    await user.type(screen.getByLabelText("Password"), "admin");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith("admin", "admin");
    });

    expect(mockedSaveStoredSession).toHaveBeenCalledWith(session);
    expect(mockedReplace).toHaveBeenCalledWith("/");
  });
});
