import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UsersRepositoryService } from "./repositories/users-repository.service";
import { CreateUsersDTO } from "./dtos/create-usersDTO";
import { Users } from "@prisma/client";
import { UpdateUsersDTO } from "./dtos/update-usersDTO";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepositoryService) {}

  async create({
    name,
    email,
    password,
    phone,
    city,
  }: CreateUsersDTO): Promise<Users> {
    const userExits = await this.usersRepository.findByEmail(email);

    if (userExits) {
      throw new ConflictException("Email is already in use");
    }

    const user = await this.usersRepository.create({
      name,
      email,
      password,
      phone,
      city,
    });

    return user;
  }

  async update(id: number, updateData: UpdateUsersDTO): Promise<Users> {
    const userExists = await this.usersRepository.findById(id);

    if (!userExists) {
      throw new NotFoundException("User not found");
    }

    if (updateData.phone && updateData.phone !== userExists.phone) {
      const phoneInUse = await this.usersRepository.findByPhone(
        updateData.phone,
        id,
      );

      if (phoneInUse) {
        throw new ConflictException(
          `Phone number ${updateData.phone} is already in use`,
        );
      }
    }

    const user = await this.usersRepository.update(id, {
      name: updateData.name,
      phone: updateData.phone,
      city: updateData.city,
    });
    return user;
  }

  async getAll(): Promise<Users[]> {
    const users = await this.usersRepository.findAll();
    if (users.length <= 0) {
      throw new NotFoundException("Empty user list");
    }
    return users;
  }

  async show(id: number): Promise<Users> {
    const userExists = await this.usersRepository.findById(id);
    if (!userExists) {
      throw new NotFoundException("User not found");
    }

    return userExists;
  }

  async delete(id: number) {
    const userExits = await this.usersRepository.findById(id);
    if (!userExits) {
      throw new NotFoundException("User not found");
    }

    return this.usersRepository.delete(id);
  }
}
