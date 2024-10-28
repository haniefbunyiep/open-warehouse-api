import { Inject, Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './interface/cloudinary-response';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly PUBLIC_ID_PATTERN = /\/v\d+\/(.+?)(?:\.[^.]+)?$/;

  constructor(
    @Inject('CLOUDINARY') private cloudinaryInstance: typeof cloudinary,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    folderName: string,
  ): Promise<string> {
    try {
      this.logger.log(
        `Uploading file: ${file.originalname} to folder: ${folderName}`,
      );

      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      const uploadResponse = await this.cloudinaryInstance.uploader.upload(
        dataURI,
        {
          folder: folderName,
          resource_type: 'auto',
        },
      );

      return uploadResponse.secure_url;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${file.originalname}`, error);
      throw error;
    }
  }

  async findAllImagesFromFolder(folderName: string): Promise<string[]> {
    this.logger.log(`Retrieving images from folder: ${folderName}`);
    const imageUrls: string[] = [];
    let nextCursor: string | null = null;

    try {
      do {
        this.logger.log(`Retrieving images with cursor: ${nextCursor}`);
        const params: any = {
          type: 'upload',
          max_results: 500,
          prefix: folderName.endsWith('/') ? folderName : `${folderName}/`,
        };

        if (nextCursor) {
          params.next_cursor = nextCursor;
          this.logger.log(`Next cursor: ${nextCursor}`);
        }

        this.logger.debug('Cloudinary API request params:', params);
        const response = await this.cloudinaryInstance.api.resources(params);
        this.logger.debug('Cloudinary API response:', response);

        const resources = response.resources as CloudinaryResponse[];
        this.logger.log(`Found ${resources.length} resources in this batch`);

        resources.forEach((resource) => {
          this.logger.log(`Found image: ${resource.url}`);
          imageUrls.push(resource.url);
        });

        nextCursor = response.next_cursor;
      } while (nextCursor);

      this.logger.log(
        `Found ${imageUrls.length} images in folder: ${folderName}`,
      );
      return imageUrls;
    } catch (error) {
      throw (
        (new Error(`Failed to retrieve images from folder: ${folderName}`),
        error)
      );
    }
  }

  async deleteImage(imagePublicId: string): Promise<void> {
    this.logger.log(
      `Attempting to delete image with public ID: ${imagePublicId}`,
    );
    try {
      const result =
        await this.cloudinaryInstance.uploader.destroy(imagePublicId);

      if (result.result === 'ok') {
        this.logger.log(`Successfully deleted image: ${imagePublicId}`);
      } else {
        this.logger.warn('Unexpected result when deleting image:', result);
      }
    } catch (error) {
      this.logger.error(`Failed to delete image: ${imagePublicId}`, error);
      throw error;
    }
  }

  extractPublicIdFromUrl(imageUrl: string): string {
    const matcher = imageUrl.match(this.PUBLIC_ID_PATTERN);
    if (matcher && matcher[1]) {
      return matcher[1];
    }
    this.logger.warn(`Could not extract public ID from URL: ${imageUrl}`);
    throw new Error('Invalid Cloudinary URL format');
  }
}
