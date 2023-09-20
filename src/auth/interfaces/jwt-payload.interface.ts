/* eslint-disable prettier/prettier */
export interface jwtPayload {
    id : string; 
    iat?: number; // Fecha de creación
    exp?: number; // Fecha de expiración
}