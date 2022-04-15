import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CreateUserDto } from '../models/dto/CreateUser.dto';
import { LoginUserDto } from '../models/dto/LoginUser.dto';
import { UserI } from '../models/user.interface';
import { UserService } from '../service/user.service';

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService
    ){}

    @Post()
    create(@Body() createUserDto: CreateUserDto): Observable<UserI> {
        return this.userService.create(createUserDto);
    }

    @Post('login')
    @HttpCode(200)
    login(@Body() loginUserDto: LoginUserDto) : Observable<string> {
        return this.userService.login(loginUserDto)
    }

    @Get()
    findAll(): Observable<UserI[]> {
        return this.userService.findAll();
    }
}


