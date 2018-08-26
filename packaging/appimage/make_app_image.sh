#!/bin/sh
BASE_DIR=$(dirname "$(readlink -f "${0}")")/../../
mkdir -p AppDir

MC_NAME=Miniconda3-latest-Linux-x86_64.sh
[ ! -f $MC_NAME ] && wget -c -q https://repo.continuum.io/miniconda/$MC_NAME

cd AppDir || exit 1
HERE=$(dirname "$(readlink -f "${0}")")

bash ../$MC_NAME -b -p ./usr || exit 1
PATH="${HERE}"/usr/bin:$PATH
# conda config --add channels conda-forge
conda create -n libertem python=3.6 -y || exit 1
# FIXME: install specific version (for example from pypi, or continuous build, ...)n s

# Build wheel
( cd "$BASE_DIR" ; python setup.py bdist_wheel )

pip install "$BASE_DIR"/dist/*.whl || exit 1

rm -rf ./usr/pkgs/

cp "${BASE_DIR}/corporatedesign/logo/LiberTEM logo icon-512.png" ./libertem-icon-512.png

cat > ./AppRun <<\EOF
#!/bin/sh
HERE=$(dirname "$(readlink -f "${0}")")
export PATH="${HERE}"/usr/bin:$PATH
libertem-server "$@"
EOF

chmod a+x ./AppRun

rm ../$MC_NAME

cat > ./LiberTEM.desktop <<EOF
[Desktop Entry]
Type=Application
Terminal=true
Name=LiberTEM
Icon=libertem-icon-512
Exec=LiberTEM %u
Categories=Science;
StartupNotify=true
EOF

echo "AppDir created, creating AppImage..."

cd .. || exit 1

wget -c -q "https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage"
chmod a+x appimagetool-x86_64.AppImage
export VERSION=$(git rev-parse --short HEAD) # linuxdeployqt uses this for naming the file
./appimagetool-x86_64.AppImage AppDir -g

echo "done"
