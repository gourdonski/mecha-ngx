import { Injectable } from '@angular/core';

@Injectable()
export class MechaUtilService {
  // http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
  /**
   * Converts a string to a hash code
   * @param {string} val Value to be hashed
   *
   * @returns {number} Hash code generated from input value
  */
  public getHashCode(val: any): number {
    if (!(typeof val === 'string' || val instanceof String)) {
      return null;
    }

    let hash = 0;

    let chr;

    if (val.length === 0) {
      return hash;
    }

    for (let i = 0; i < val.length; i++) {
        chr   = val.charCodeAt(i);
        // tslint:disable-next-line:no-bitwise
        hash  = ((hash << 5) - hash) + chr;
        // tslint:disable-next-line:no-bitwise
        hash |= 0; // convert to 32-bit integer
    }

    return hash;
}
}
