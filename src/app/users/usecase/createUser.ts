import { parseWith } from "../../../core/validator.js";
import { CreateUserInput } from "../schema.js";
import { auth } from "../../../config/auth.js";
import { DomainError } from "../../../core/result.js";

export async function createUser(input: CreateUserInput) {
  const { name, email, password, image } = parseWith(CreateUserInput, input);
  try {
    const res = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        ...(image !== undefined ? { image: image ?? undefined } : {}),
      },
    });
    return res.user;
  } catch (e) {
    throw new DomainError("Failed to create user", "CREATE_FAILED");
  }
}

