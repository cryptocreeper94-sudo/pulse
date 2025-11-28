#!/usr/bin/env python3
"""
Remove backgrounds from agent and cat images using rembg.
Creates transparent PNGs for use as cutout buttons.
"""

import os
from pathlib import Path
from rembg import remove
from PIL import Image
import io

TRADING_CARDS_DIR = Path("darkwave-web/public/trading-cards")
OUTPUT_DIR = Path("darkwave-web/public/trading-cards-cutouts")

IMAGES_TO_PROCESS = [
    "african_american_bald_male.png",
    "african_american_female_agent.png",
    "asian_female_agent.png",
    "asian_male_agent_headshot.png",
    "caucasian_blonde_female.png",
    "caucasian_blonde_male_agent.png",
    "caucasian_brown-haired_female.png",
    "caucasian_brown-haired_male.png",
    "caucasian_red-haired_female.png",
    "caucasian_redhead_male_agent.png",
    "latina_female_agent.png",
    "latino_male_agent.png",
    "mixed_asian-caucasian_female.png",
    "mixed_asian-caucasian_male.png",
    "mixed_black-caucasian_female.png",
    "mixed_black-caucasian_male.png",
    "mixed_black-latina_female.png",
    "mixed_black-latino_male.png",
    "mixed_latina-asian_female.png",
    "mixed_latino-asian_male.png",
    "Grumpy_cat_angry_pose_63318575.png",
    "Grumpy_cat_arms_crossed_f8e46099.png",
    "Grumpy_cat_facepalm_pose_2fdc5a6a.png",
    "Grumpy_cat_fist_pump_e028a55a.png",
    "Grumpy_cat_neutral_pose_ba4a1b4d.png",
    "Grumpy_cat_pointing_pose_6bbe6ae8.png",
    "Grumpy_cat_sideeye_pose_5e52df88.png",
    "Grumpy_cat_thumbs_up_e77056f4.png",
    "Grumpy_cat_walking_pose_4be44c5b.png",
    "Grumpy_orange_Crypto_Cat_ac1ff7e8.png",
]

def remove_background(input_path: Path, output_path: Path):
    """Remove background from a single image."""
    print(f"Processing: {input_path.name}")
    
    try:
        with open(input_path, "rb") as f:
            input_data = f.read()
        
        output_data = remove(input_data)
        
        img = Image.open(io.BytesIO(output_data))
        img = img.convert("RGBA")
        
        img.save(output_path, "PNG")
        print(f"  ✓ Saved: {output_path.name}")
        return True
        
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("🎨 Background Removal Tool (using rembg)")
    print("=" * 60)
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"\nOutput directory: {OUTPUT_DIR}")
    
    success_count = 0
    fail_count = 0
    
    for filename in IMAGES_TO_PROCESS:
        input_path = TRADING_CARDS_DIR / filename
        output_path = OUTPUT_DIR / filename
        
        if not input_path.exists():
            print(f"⚠ Skipping (not found): {filename}")
            continue
        
        if remove_background(input_path, output_path):
            success_count += 1
        else:
            fail_count += 1
    
    print("\n" + "=" * 60)
    print(f"✅ Processed: {success_count} images")
    if fail_count:
        print(f"❌ Failed: {fail_count} images")
    print("=" * 60)
    print(f"\nCutout images saved to: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
