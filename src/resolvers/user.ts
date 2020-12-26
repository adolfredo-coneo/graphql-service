import {
  Arg,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { User } from "../entities/User";
import { getConnection } from "typeorm";
import argon2 from "argon2";

@ObjectType()
class UserResponse {
  @Field(() => String, { nullable: true })
  errors?: string;

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {

  //Query Users
  @Query(() => [User])
  async users(): Promise<User[]> {
    return await User.find();
  }

  //Query Single User
  @Query(() => User, { nullable: true })
  async user(@Arg("id") id: number): Promise<User | undefined> {
    return await User.findOne(id);
  }

  //Mutation Register Resolver
  @Mutation(() => UserResponse)
  async register(
    @Arg("username") username: string,
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<UserResponse> {
    let userResponse;
    try {
      const hashedPassword = await argon2.hash(password);
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: username,
          email: email,
          password: hashedPassword,
        })
        .returning("*")
        .execute();
      userResponse = result.raw[0];
    } catch (err) {
      userResponse = {
        errors: err.detail,
      };

      return userResponse;
    }

    return {
      user: userResponse,
    };
  }

  //Mutation Login Resolver
  @Mutation(() => UserResponse)
  async login(
    @Arg("username") username: string,
    @Arg("password") password: string
  ): Promise<UserResponse> {
    const user = await User.findOne({
      username: username.toLowerCase(),
    });

    let userResponse;
    if (!user) {
      userResponse = {
        errors: "That Username doesn't exist",
      };

      return userResponse;
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      userResponse = {
        errors: "That Password is not valid",
      };

      return userResponse;
    }

    return {
      user: user,
    };
  }
}
