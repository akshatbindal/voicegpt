import whisper
import sys

def transcribe(audio_file):
    model = whisper.load_model("base")
    result = model.transcribe(audio_file)
    return result['text']

if __name__ == "__main__":
    audio_file = sys.argv[1]  # Get the audio file path from command line
    text = transcribe(audio_file)
    print(text)
