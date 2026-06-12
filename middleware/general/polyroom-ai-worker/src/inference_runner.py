import argparse
import os
import sys
import traceback

import cv2
import numpy as np
import trimesh
from env import (GENERAL_POLYROOM_AI_WORKER_POLYROOM_ROOT,
                 GENERAL_POLYROOM_AI_WORKER_QUEUE_FROM_NAME,
                 GENERAL_POLYROOM_AI_WORKER_QUEUE_TO_EXCHANGE)
from mmdet.apis import inference_detector, init_detector
from shapely.geometry import Polygon

# 🛑 NAMESPACE FIX: Inject PolyRoom root into Python's brain before loading AI libraries
sys.path.insert(0, GENERAL_POLYROOM_AI_WORKER_POLYROOM_ROOT)

parser = argparse.ArgumentParser()
parser.add_argument("--model_path", type=str, required=True)
parser.add_argument("--out_glb", type=str, required=True)
parser.add_argument("--out_obj", type=str, required=True)
parser.add_argument("--images", type=str, nargs='+', required=True)
args = parser.parse_args()

# PolyRoom / MMDetection imports (Adjust these based on PolyRoom's exact repo structure)


def preprocess_image(image_path: str) -> str:
    """
    PHASE 1: THE HACKER FIX (OpenCV)
    Turns a white architectural floor plan into a dark, fuzzy 'Density Map'
    so PolyRoom thinks it's looking at a 3D point cloud scan.
    """
    print(f"[Runner] Pre-processing image: {image_path}", flush=True)

    # 1. Load as Grayscale
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

    # 2. Invert colors (White walls become black, black lines become white)
    inverted_img = cv2.bitwise_not(img)

    # 3. Apply Gaussian Blur to create the "fuzzy" point-cloud density look
    blurred_img = cv2.GaussianBlur(inverted_img, (5, 5), 0)

    # Save the processed image to a temporary file
    processed_path = image_path.replace(".png", "_density.png")
    cv2.imwrite(processed_path, blurred_img)

    return processed_path


def extrude_to_3d(polygons: list, glb_out: str, obj_out: str):
    """
    PHASE 3: THE EXTRUDER (Trimesh)
    Takes the 2D wall coordinates, draws them on a plane, and extrudes them up.
    """
    print("[Runner] Extruding 2D polygons into 3D meshes...", flush=True)

    wall_height = 2.8  # Standard room height in meters
    meshes = []

    for poly_coords in polygons:
        # Create a 2D shapely polygon from the PolyRoom coordinates
        poly_2d = Polygon(poly_coords)

        # Extrude the 2D polygon straight up along the Z axis
        mesh = trimesh.creation.extrude_polygon(poly_2d, height=wall_height)
        meshes.append(mesh)

    # Combine all the separate wall segments into one giant room mesh
    combined_room = trimesh.util.concatenate(meshes)

    # Export the final 3D files!
    combined_room.export(glb_out)
    combined_room.export(obj_out)
    print(f"[Runner] Successfully saved {glb_out} and {obj_out}", flush=True)


def main():
    try:
        print("[Runner] Booting PolyRoom AI Pipeline...", flush=True)

        # 1. Preprocess the first uploaded image
        input_image = args.images[0]
        density_map_path = preprocess_image(input_image)

        # 2. PHASE 2: POLYROOM INFERENCE
        # (Note: You will need to map these exact file names to the ones you downloaded!)
        config_file = os.path.join(
            GENERAL_POLYROOM_AI_WORKER_POLYROOM_ROOT, 'mask2former_config.py')
        checkpoint_file = os.path.join(
            GENERAL_POLYROOM_AI_WORKER_POLYROOM_ROOT, 'checkpoints/polyroom_latest.pth')

        print("[Runner] Loading PolyRoom Checkpoint into GPU...", flush=True)
        model = init_detector(config_file, checkpoint_file, device='cuda:0')

        print("[Runner] Analyzing Density Map...", flush=True)
        result = inference_detector(model, density_map_path)

        # Extract the polygon coordinate array from the MMDetection result object
        # (You will need to check PolyRoom's output format, usually it's bounding boxes or segmentation masks)
        # Mocking the data extraction for the architectural flow:
        # extracted_polygons = extract_polygons_from_result(result)

        # For testing the pipeline before PolyRoom is fully hooked up, use a mock square room:
        extracted_polygons = [
            [[-5, -5], [5, -5], [5, -4.8], [-5, -4.8]],  # South Wall
            [[4.8, -5], [5, 5], [4.8, 5], [4.8, -5]],   # East Wall
            [[-5, 5], [5, 5], [5, 4.8], [-5, 4.8]],     # North Wall
            [[-5, -5], [-4.8, -5], [-4.8, 5], [-5, 5]]  # West Wall
        ]

        # 3. Extrude and save!
        extrude_to_3d(extracted_polygons, args.out_glb, args.out_obj)

        print("[Runner] Inference Complete!", flush=True)

    except Exception as e:
        print(f"❌ FATAL ERROR TRIGGERED! Here is the full stack trace:", flush=True)
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
