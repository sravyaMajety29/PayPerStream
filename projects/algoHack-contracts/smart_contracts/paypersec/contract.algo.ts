import { Contract } from '@algorandfoundation/algorand-typescript'

export class Paypersec extends Contract {
  hello(name: string): string {
    return `Hello, ${name}`
  }
}
