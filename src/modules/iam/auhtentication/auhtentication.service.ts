import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/infra/databases/prisma.service';
import { HashingService } from '../hashing/hashing.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuhtenticationService {
  private readonly logger = new Logger(AuhtenticationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
  ) {}

  async signup(dto: SignUpDto) {
    try {
      const exist = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (exist) {
        throw new BadRequestException(['Email already exists']);
      }

      const hash = await this.hashingService.hash(dto.password);
      const { password, isActive, ...user } = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hash,
          image: dto.image,
        },
      });
      return user;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to signup: ${error}`, error?.stack);
      throw new InternalServerErrorException();
    }
  }

  async signin(dto: SignInDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const isEqual = await this.hashingService.compare(
        dto.password,
        user.password,
      );
      if (!isEqual) {
        throw new UnauthorizedException('Invalid email or password');
      }
      // TODO: return JWT
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to signup: ${error}`, error?.stack);
      throw new InternalServerErrorException();
    }
  }
}
