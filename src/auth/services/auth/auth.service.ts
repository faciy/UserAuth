import { Injectable } from '@nestjs/common';
const bcrypt = require ('bcrypt')
import { from, Observable } from 'rxjs';

@Injectable()
export class AuthService {
    
    hashPassword(password: string) : Observable<string> {
        return from<string>(bcrypt.hash(password,12));
    }

    comparePasswords(password: string, storedPasswordHash: string) : Observable<any> {
        return from(bcrypt.compare(password,storedPasswordHash))
    }
}
