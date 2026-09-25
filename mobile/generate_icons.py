import os
import json
from PIL import Image

SOURCE_IMAGE = "logo_source.png"
ANDROID_RES_DIR = "android/app/src/main/res"
IOS_ICONSET_DIR = "ios/mobile/Images.xcassets/AppIcon.appiconset"

def generate_android_icons(img):
    # (dir_name, size)
    densities = [
        ("mipmap-mdpi", 48),
        ("mipmap-hdpi", 72),
        ("mipmap-xhdpi", 96),
        ("mipmap-xxhdpi", 144),
        ("mipmap-xxxhdpi", 192)
    ]

    for folder, size in densities:
        out_folder = os.path.join(ANDROID_RES_DIR, folder)
        if not os.path.exists(out_folder):
            os.makedirs(out_folder)
        
        # Resize
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        
        # Save ic_launcher.png
        resized.save(os.path.join(out_folder, "ic_launcher.png"))
        
        # Save ic_launcher_round.png (using same image for now, ideally strictly round cropped)
        resized.save(os.path.join(out_folder, "ic_launcher_round.png"))
        print(f"Generated Android icons for {folder}")

def generate_ios_icons(img):
    # Definition based on Contents.json provided
    # key: (size, scale) -> filename
    ios_sizes = [
        (20, 2), (20, 3),
        (29, 2), (29, 3),
        (40, 2), (40, 3),
        (60, 2), (60, 3),
        (1024, 1)
    ]

    images_json = []

    for expected_size, scale in ios_sizes:
        pixel_size = expected_size * scale
        filename = f"Icon-{expected_size}x{expected_size}@{scale}x.png"
        
        # Resize
        resized = img.resize((pixel_size, pixel_size), Image.Resampling.LANCZOS)
        resized.save(os.path.join(IOS_ICONSET_DIR, filename))

        # Add to JSON structure
        entry = {
            "idiom": "ios-marketing" if expected_size == 1024 else "iphone",
            "scale": f"{scale}x",
            "size": f"{expected_size}x{expected_size}",
            "filename": filename
        }
        images_json.append(entry)
        print(f"Generated iOS icon: {filename}")

    # Write Contents.json
    contents = {
        "images": images_json,
        "info": {
            "author": "xcode",
            "version": 1
        }
    }
    
    with open(os.path.join(IOS_ICONSET_DIR, "Contents.json"), "w") as f:
        json.dump(contents, f, indent=2)
    print("Updated iOS Contents.json")

def main():
    if not os.path.exists(SOURCE_IMAGE):
        print(f"Error: {SOURCE_IMAGE} not found.")
        return

    try:
        img = Image.open(SOURCE_IMAGE)
        generate_android_icons(img)
        generate_ios_icons(img)
        print("Icon generation complete.")
    except Exception as e:
        print(f"Error generating icons: {str(e)}")

if __name__ == "__main__":
    main()
