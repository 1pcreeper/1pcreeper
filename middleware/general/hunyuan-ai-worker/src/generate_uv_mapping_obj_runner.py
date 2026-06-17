import argparse
import os
import sys
import traceback

import torch
from Hunyuan3D.hy3dgen.shapegen import Hunyuan3DDiTFlowMatchingPipeline

# 🛑 THE ULTIMATE NAMESPACE FIX 🛑
# Forcefully inject the mounted volume path into Python's primary search registry
# This must happen BEFORE any other imports!
sys.path.insert(0, "/app/src/Hunyuan3D")


if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(
        description="Run isolated Hunyuan3D-2 Inference")
    parser.add_argument("--images", nargs='+', required=True)
    parser.add_argument("--out_glb", required=True)
    parser.add_argument("--out_obj", required=True)
    parser.add_argument("--model_path", required=True,
                        help="Absolute path to your downloaded weights")

    args = parser.parse_args()

    try:
        print(f"[Runner] PyTorch Version: {torch.__version__}", flush=True)
        print(
            f"[Runner] CUDA Available: {torch.cuda.is_available()}", flush=True)

        if torch.cuda.is_available():
            print(
                f"[Runner] GPU Detected: {torch.cuda.get_device_name(0)}", flush=True)
        else:
            print(
                "⚠️ [Runner] WARNING: NO GPU DETECTED! PyTorch will use CPU. This will take hours!", flush=True)
        print("[Runner] Loading Hunyuan3D-2 Pipeline into GPU...", flush=True)

        # Load directly from your F: drive folder to bypass the C: drive cache!
        pipeline = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained(
            args.model_path)

        print(
            f"[Runner] Generating 3D mesh from {len(args.images)} image(s)...", flush=True)
        mesh = pipeline(image=args.images[0])[0]

        print("[Runner] Exporting meshes to sandbox...", flush=True)
        mesh.export(args.out_glb)
        mesh.export(args.out_obj)

        print("[Runner] Inference Complete!", flush=True)

    except Exception as e:
        print("❌ FATAL ERROR TRIGGERED! Here is the full stack trace:")
        traceback.print_exc()  # <-- This will print the exact file and line number!
        sys.exit(1)


if __name__ == "__main__":
    main()
