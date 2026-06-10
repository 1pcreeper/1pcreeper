import io
import os
import subprocess
import tempfile
import time
from typing import List, Tuple


def execute_hunyuan_inference(project_id: int, image_bytes_list: List[bytes]) -> Tuple[io.BytesIO, io.BytesIO]:

    with tempfile.TemporaryDirectory() as temp_dir:
        # input_dir = os.path.join(temp_dir, "inputs")
        # output_dir = os.path.join(temp_dir, "output")
        # os.makedirs(input_dir, exist_ok=True)

        # # 1. Write ALL images to the temporary inputs folder
        # for idx, img_bytes in enumerate(image_bytes_list):
        #     img_path = os.path.join(input_dir, f"view_{idx}.jpg")
        #     with open(img_path, "wb") as f:
        #         f.write(img_bytes)

        # # 2. Build the Command Line execution string
        # # ⚠️ NOTE: Check your local Hunyuan3D documentation!
        # # If it requires a folder, pass the `input_dir`.
        # # If it requires specific flags like --front, --back, --left, you will need to map them here.
        # command = [
        #     PYTHON_EXEC,
        #     os.path.join(HUNYUAN_ROOT, "main.py"),
        #     "--image_dir", input_dir,  # Passing the whole folder of references
        #     "--save_folder", output_dir
        # ]

        # print(f"⚙️ [Hunyuan AI] Executing: {' '.join(command)}")

        # # 3. Run the AI! (This will block the thread for several minutes while the GPU works)
        # # capture_output=True grabs the AI's terminal logs so we can see if it crashed.
        # result = subprocess.run(command, cwd=HUNYUAN_ROOT, capture_output=True, text=True)

        # if result.returncode != 0:
        #     print(f"❌ [Hunyuan AI] GPU Inference crashed!\n{result.stderr}")
        #     raise RuntimeError("Hunyuan3D process failed. Check GPU VRAM and dependencies.")

        # # 4. Hunt for the generated files inside the output folder
        # glb_path = None
        # obj_path = None

        # # Walk through whatever folder structure Hunyuan created to find our meshes
        # for root, dirs, files in os.walk(output_dir):
        #     for file in files:
        #         if file.endswith(".glb"):
        #             glb_path = os.path.join(root, file)
        #         elif file.endswith(".obj"):
        #             obj_path = os.path.join(root, file)

        # if not glb_path or not obj_path:
        #     raise FileNotFoundError(f"AI finished successfully, but could not find .glb or .obj in {output_dir}")

        # # 5. Load the generated 3D files back into RAM so RabbitMQ can upload them to MinIO
        # with open(glb_path, "rb") as f:
        #     glb_stream = io.BytesIO(f.read())

        # with open(obj_path, "rb") as f:
        #     obj_stream = io.BytesIO(f.read())

        # print(f"🎨 [Hunyuan AI] 3D Generation 100% successful for Project {project_id}!")

        # The 'with tempfile...' block ends here, instantly deleting the temp files on your disk.
        glb_stream = io.BytesIO(b"fake glb data for testing")
        obj_stream = io.BytesIO(b"fake obj data for testing")
        return glb_stream, obj_stream
