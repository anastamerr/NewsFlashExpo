import { Inconsolata_500Medium, Inconsolata_700Bold } from '@expo-google-fonts/inconsolata';
import { Newsreader_500Medium, Newsreader_700Bold } from '@expo-google-fonts/newsreader';
import { useFonts } from 'expo-font';

export function useAppFonts() {
  return useFonts({
    Inconsolata_500Medium,
    Inconsolata_700Bold,
    Newsreader_500Medium,
    Newsreader_700Bold,
  });
}
