import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { PayloadToken } from './models';
import { User } from 'src/users/entities/user.entity';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async signup(data: CreateUserDto) {
    const newModel = new this.userModel(data);
    const hashPassword = await bcrypt.hash(newModel.password, 10);
    newModel.password = hashPassword;
    await newModel.save();

    return {
      message: 'User registered successfully',
      statusCode: HttpStatus.CREATED,
    };
  }

  async findOne(data: UpdateUserDto) {
    return await this.userModel.findOne(data).exec();
  }

  async validateUser(email: string, password: string) {
    const user = await this.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const userWithoutPassword = Object.assign({}, user.toJSON());
        delete userWithoutPassword.password;
        return userWithoutPassword;
      }
    }
    return null;
  }

  generateJWT(user: User) {
    const payload: PayloadToken = { sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
