import sys
import json
import lasio

def main():
    if len(sys.argv) < 2:
        print("No file path provided", file=sys.stderr)
        sys.exit(1)

    file_path = sys.argv[1]

    try:
        las = lasio.read(file_path)

        # Assume first column is depth
        depth = las.index
        depth_min = float(depth.min())
        depth_max = float(depth.max())

        # Convert curves to a readable format
        curves = []
        for curve in las.curves:
            curves.append({
                "mnemonic": curve.mnemonic,
                "unit": curve.unit,
                "description": curve.descr
            })

        output = {
            "well": dict(las.well),
            "depth_min": depth_min,
            "depth_max": depth_max,
            "curves": curves
        }

        print(json.dumps(output))
    except Exception as e:
        print(f"Parser error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
