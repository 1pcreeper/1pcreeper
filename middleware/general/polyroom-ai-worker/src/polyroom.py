import io
import os
import subprocess
import tempfile
from concurrent.futures import process
from typing import List, Tuple
from unittest import result

from env import GENERAL_POLYROOM_AI_WORKER_POLYROOM_ROOT


def execute_polyroom_inference(project_id: int, image_bytes_list: List[bytes]) -> Tuple[io.BytesIO, io.BytesIO]:
    """
    Executes Polyroom GPU inference by calling our dedicated runner script.
    """
    image_count = len(image_bytes_list)
    print(
        f"🤖 [Polyroom] Orchestrating GPU inference for Project {project_id}...", flush=True)

    with tempfile.TemporaryDirectory() as temp_dir:
        input_dir = os.path.join(temp_dir, "inputs")
        output_dir = os.path.join(temp_dir, "output")
        os.makedirs(input_dir, exist_ok=True)
        os.makedirs(output_dir, exist_ok=True)

        # 1. Write the images to the temporary sandbox
        img_paths = []
        for idx, img_bytes in enumerate(image_bytes_list):
            img_path = os.path.join(input_dir, f"view_{idx}.png")
            with open(img_path, "wb") as f:
                f.write(img_bytes)
            img_paths.append(img_path)

        glb_out = os.path.join(output_dir, "mesh.glb")
        obj_out = os.path.join(output_dir, "mesh.obj")

        # 2. Locate our physical runner script
        # __file__ looks at the current location of hunyuan.py, ensuring it always finds inference_runner.py
        current_dir = os.path.dirname(os.path.abspath(__file__))
        runner_script = os.path.join(current_dir, "inference_runner.py")

        # 3. Setup the environment so Python knows where to find 'hy3dgen'
        env = os.environ.copy()
        # os.pathsep automatically uses ';' for Windows and ':' for Linux/Docker!
        env["PYTHONPATH"] = f"{GENERAL_POLYROOM_AI_WORKER_POLYROOM_ROOT}{os.pathsep}{env.get('PYTHONPATH', '')}"

        # 4. Build the exact command-line array
        # This translates to: python src/inference_runner.py --out_glb ... --out_obj ... --images img1.png img2.png
        command = [
            "python", runner_script,
            "--out_glb", glb_out,
            "--out_obj", obj_out,
            "--model_path", os.path.join(
                GENERAL_POLYROOM_AI_WORKER_POLYROOM_ROOT),
            "--images"
        ] + img_paths

        print(
            f"⚙️ [Polyroom] Booting subprocess: {runner_script}", flush=True)

        # 5. Execute!
        process = subprocess.Popen(
            command,
            cwd=GENERAL_POLYROOM_AI_WORKER_POLYROOM_ROOT,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            env=env,
            bufsize=1,
            universal_newlines=True
        )

        for line in process.stdout:
            # end="" prevents double spacing
            print(f"🖥️ [Worker {project_id}] {line}", end="")

        # 3. Wait for the process to formally close
        process.wait()

        # 6. Catch errors
        if process.returncode != 0 or not os.path.exists(glb_out):
            print(
                f"❌ [Polyroom] GPU Inference crashed!\n--- STDERR ---\n{process.stderr}\n--- STDOUT ---\n{process.stdout}", flush=True)
            raise RuntimeError(
                "Polyroom process failed. Check your console logs.")

        # 7. Read the generated meshes back into RAM
        with open(glb_out, "rb") as f:
            glb_stream = io.BytesIO(f.read())

        with open(obj_out, "rb") as f:
            obj_stream = io.BytesIO(f.read())

        print(
            f"🎨 [Polyroom] 3D Generation 100% successful for Project {project_id}!", flush=True)

        return glb_stream, obj_stream
