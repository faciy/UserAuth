import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable,switchMap } from 'rxjs';
import {map} from 'rxjs/operators';
import { AuthService } from 'src/auth/services/auth/auth.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../models/dto/CreateUser.dto';
import { LoginUserDto } from '../models/dto/LoginUser.dto';
import { UserEntity } from '../models/user.entity';
import { UserI } from '../models/user.interface';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository : Repository<UserEntity>,
        private authService: AuthService
    ){}

    create(createUserDto : CreateUserDto): Observable<UserI> {
        // return from(this.userRepository.save(user))
        return this.mailExists(createUserDto.email).pipe(
            switchMap((exists : boolean) => {
                if(!exists){
                    return this.authService.hashPassword(createUserDto.password).pipe(
                        switchMap((passwordHash : string) => {
                            createUserDto.password = passwordHash;
                            return from(this.userRepository.save(createUserDto)).pipe(
                                map((savedUser: UserI) => {
                                    const {password, ...user} = savedUser;
                                    return user;
                                })
                            )
                        })
                    )
                }else{
                    throw new HttpException('Email already in use', HttpStatus.CONFLICT);
                }{}
            })
        )
    }

    login(loginUserDto : LoginUserDto) : Observable<string> {
        return this.findUserByEmail(loginUserDto.email).pipe(
            switchMap((user :UserI) => {
                if(user){
                    return this.validatePassword(loginUserDto.password, user.password).pipe(
                        map((passwordsMatches : boolean) => {
                            if(passwordsMatches) {
                                return 'Login was Successfull'
                            }else{
                                throw new HttpException('Login was not Successfull', HttpStatus.UNAUTHORIZED);
                            }
                        })
                    )
                }else{
                    throw new HttpException('User not found', HttpStatus.NOT_FOUND)
                }
            })
        )
    }

    findAll() : Observable<UserI[]> {
        return from(this.userRepository.find())
    }

    private findUserByEmail(email : string) : Observable<UserI> {
        return from(this.userRepository.findOne({email}, {select : ['id', 'email', 'name', 'password']}));
    }

    private validatePassword(password: string, storedPasswordHash: string) : Observable<boolean>{
        return this.authService.comparePasswords(password,storedPasswordHash)
    }

    private mailExists(email: string) : Observable<boolean> {
        return from(this.userRepository.findOne({email})).pipe(
            map((user : UserI) => {
                if(user){
                    return true;
                }else{
                    return false;
                }
            })
        )
    }
}
