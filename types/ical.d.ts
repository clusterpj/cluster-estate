declare module 'ical.js' {
  export class Component {
    constructor(jCal: any)
    getAllSubcomponents(name: string): Component[]
    getFirstPropertyValue<T = string>(name: string): T
    getFirstProperty(name: string): Property
  }

  export class Event {
    constructor(component: Component | null, options?: { strictExceptions: boolean })
    
    summary: string
    description: string
    location: string
    uid: string
    sequence: number
    startDate: Time
    endDate: Time
    duration: Duration
    organizer: string
    attendees: Attendee[]
    status: string | null
  }

  export class Time {
    constructor(data?: {
      year?: number;
      month?: number;
      day?: number;
      hour?: number;
      minute?: number;
      second?: number;
      isDate?: boolean;
    })
    
    toJSDate(): Date
    fromJSDate(date: Date): void
  }

  export class Duration {
    toSeconds(): number
  }

  export class Property {
    getFirstValue<T = string>(): T
    getValues<T = string>(): T[]
  }

  export class Attendee {
    toString(): string
    getValues(): string[]
  }

  export function parse(input: string): any
}
