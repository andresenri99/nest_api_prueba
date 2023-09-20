/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';

import { User } from './entities/user.entity';

import { UpdateAuthDto, CreateUserDto, RegisterUserDto, LoginDto } from './dto/dto';

import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

import { Model } from 'mongoose';
import * as bcryptjs from "bcryptjs";

import { jwtPayload } from './interfaces/jwt-payload.interface';
import { LoginResponse } from './interfaces/login-response.interface';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) 
    private userModel: Model<User>,
    private jwtService: JwtService
  ){}

  async register(registerUserDto: RegisterUserDto): Promise<LoginResponse>{
    const newUser = await this.create(registerUserDto);
    
    return {
      user: newUser,
      token: this.getJwtToken({ id: newUser._id })
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const newUser = new this.userModel(createUserDto);
      
      newUser.password = bcryptjs.hashSync(createUserDto.password, 8);
  
      await newUser.save();
      const { password:_, ...user}= newUser.toJSON();// La barra baja es para excluir la contraseña del ...user
      // Al desestructurar un objeto se puede guardar el resto de atributos en una variable poniendo ... antes del nombre
      return user;

      /* //Otra forma de hacerlo
      const { password, ...userData}= createUserDto;
      const newUser = new this.userModel({
        password: bcryptjs.hashSync(createUserDto.password, 8),
        ...userData
      }) 
      await newUser.save();
      const { password:_, ...user}= newUser.toJSON();
      return user;
      */

    } catch (error) {
      if( error.code === 11000){
        throw new BadRequestException(`${createUserDto.email} already exists!`)
      }
      throw new InternalServerErrorException("Something terrible happened!")
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password}= loginDto;
    const user = await this.userModel.findOne({ email }) // o así { email: email, password: password }
    
    if(!user) throw new BadRequestException("Not valid credentials - email");

    if (!bcryptjs.compareSync(password, user.password)) throw new BadRequestException("Not valid credentials - password");

    const { password:_, ...rest } = user.toJSON();
    return {
      user: rest,
      token: this.getJwtToken({ id: user.id })
    };
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

/*   findOne(id: number) {
    return `This action returns a #${id} auth`;
  }
 */
  async findUserById(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    const { password: _, ...rest } = user.toJSON();
    return rest;
  }

/*   update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  } */

  getJwtToken(payload: jwtPayload){
    const token = this.jwtService.sign(payload);
    return token;
  }
}
