import { IIdentityDto, IIdentityDtoPublic } from './types';

export function adaptToIdentityDtoPublic(dto: IIdentityDto): IIdentityDtoPublic {
  const pub: IIdentityDtoPublic = {
    id:       dto.id,
    username: dto.username,
  }
  if (dto.created_at) pub.created_at = dto.created_at;
  if (dto.updated_at) pub.updated_at = dto.updated_at;
  if (dto.name)       pub.name = dto.name;
  if (dto.email)      pub.email = dto.email;
  return pub;
}
