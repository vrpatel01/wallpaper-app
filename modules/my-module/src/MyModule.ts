import { NativeModule, requireNativeModule } from 'expo';

declare class MyModule extends NativeModule<{}> {
  setWallpaper(uriString: string, screenType: 'home' | 'lock' | 'both'): Promise<string>;
}

export default requireNativeModule<MyModule>('MyModule');
