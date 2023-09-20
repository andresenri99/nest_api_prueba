/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL/* , {dbName: process.env.DB_NAME} */), 
    // Se puede añadir el nombre de la colección ("tabla") sin tener que ponerlo junto al enlace de la conexión
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
