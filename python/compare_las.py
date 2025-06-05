# python/compare_las.py

import sys
import os
import lasio
import matplotlib.pyplot as plt

def main(file_paths):
    if len(file_paths) < 2:
        print("Error: Please provide at least two LAS files.", file=sys.stderr)
        sys.exit(1)

    output_file = os.path.join(os.path.dirname(__file__), 'comparison_plot.png')
    curves_to_plot = ['GR', 'RT', 'NPHI', 'RHOB', 'PHI']
    colors = ['red', 'blue', 'green', 'purple', 'orange', 'black']
    # curve_info = {"GR": "Gamma Ray", "NPHI": "Neutron Porosity", "RHOB": "Bulk Density", "RT": "Resistivity", "PHI": "Porosity"}

    fig, axs = plt.subplots(1, len(curves_to_plot), figsize=(20, 8), sharey=True)

    for i, file_path in enumerate(file_paths):
        try:
            las = lasio.read(file_path)
            depth = las.index if las.index is not None else las['DEPTH']
        except Exception as e:
            print(f"Failed to read {file_path}: {e}", file=sys.stderr)
            sys.exit(1)

        for j, curve in enumerate(curves_to_plot):
            if curve in las.curves:
                try:
                    axs[j].plot(las[curve], depth, label=os.path.basename(file_path), color=colors[i % len(colors)])
                    axs[j].set_title(curve)
                    axs[j].invert_yaxis()
                    axs[j].set_xlabel(curve)
                    if j == 0:
                        axs[j].set_ylabel("Depth (m)")
                except Exception as e:
                    print(f"Error plotting {curve} in {file_path}: {e}", file=sys.stderr)
                    continue

    for ax in axs:
        ax.grid(True)
        ax.legend()

    plt.tight_layout()
    plt.savefig(output_file)
    print(output_file) 
     # Output path is captured in Node.js

if __name__ == "__main__":
    main(sys.argv[1:])
