import {genSalt, hash} from 'bcrypt'
// import {salt} from '../config/auth.config'

export async function bEncryptPass(password: string) {
    /**
     * @description Encrypta a password para entrar na DB, já salted.
     * @returns Promise
     */
    let salt = await genSalt(10);
    return hash(password, salt)
}