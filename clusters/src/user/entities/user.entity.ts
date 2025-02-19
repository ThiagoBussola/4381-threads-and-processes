import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop()
  dateBirth: Date;

  @Prop()
  company: string;

  @Prop()
  password: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  lastPasswordUpdateAt: Date;

  @Prop()
  needsPasswordChange: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
