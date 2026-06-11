import { ApplicationConfig } from '../../../config/applicationConfig';

export type MapConfigResponse = {
  readonly lat: number;
  readonly lng: number;
  readonly zoom: number;
};

export class GetMapConfigUseCase {
  public constructor(private readonly applicationConfig: ApplicationConfig) {}

  public execute(): MapConfigResponse {
    return {
      lat: this.applicationConfig.mapInitialLatitude,
      lng: this.applicationConfig.mapInitialLongitude,
      zoom: this.applicationConfig.mapInitialZoom
    };
  }
}
