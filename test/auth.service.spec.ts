import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "@prisma/client";
import { hash } from "bcryptjs";
import { AuthService } from "../src/auth/auth.service";
import { PrismaService } from "../src/prisma/prisma.service";

describe("AuthService", () => {
  const prismaService = {
    user: {
      findUnique: jest.fn(),
    },
  } as unknown as PrismaService;

  const jwtService = {
    signAsync: jest.fn(),
  } as unknown as JwtService;

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(prismaService, jwtService);
  });

  it("returns token and user data for valid credentials", async () => {
    const passwordHash = await hash("admin", 12);

    jest.spyOn(prismaService.user, "findUnique").mockResolvedValue({
      id: "user-1",
      username: "admin",
      passwordHash,
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    jest.spyOn(jwtService, "signAsync").mockResolvedValue("signed-token");

    const result = await service.login({
      username: "admin",
      password: "admin",
    });

    expect(result.accessToken).toBe("signed-token");
    expect(result.user.username).toBe("admin");
  });

  it("throws for invalid credentials", async () => {
    jest.spyOn(prismaService.user, "findUnique").mockResolvedValue(null);

    await expect(
      service.login({
        username: "admin",
        password: "wrong",
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("throws for wrong password", async () => {
    const passwordHash = await hash("admin", 12);

    jest.spyOn(prismaService.user, "findUnique").mockResolvedValue({
      id: "user-1",
      username: "admin",
      passwordHash,
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      service.login({
        username: "admin",
        password: "wrong-password",
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
