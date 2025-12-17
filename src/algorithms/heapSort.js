export const heapSort = async (arr, { updateArray, setComparisons, setSwaps, setCurrentStep, setSortedIndices }) => {
    const n = arr.length;

    const heapify = async (arr, n, i, passId) => {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        if (left < n) {
            setComparisons(c => c + 1);
            if (arr[left].value > arr[largest].value) largest = left;
        }
        if (right < n) {
            setComparisons(c => c + 1);
            if (arr[right].value > arr[largest].value) largest = right;
        }
        if (largest !== i) {
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            setSwaps(s => s + 1);
            if (!await updateArray(arr, [i, largest], [], passId)) return;
            await heapify(arr, n, largest, passId);
        }
    };

    setCurrentStep('Building max heap');
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        await heapify(arr, n, i, 'build');
    }
    for (let i = n - 1; i > 0; i--) {
        setCurrentStep(`Extracting maximum element to position ${i}`);
        [arr[0], arr[i]] = [arr[i], arr[0]];
        setSwaps(s => s + 1);
        if (!await updateArray(arr, [0, i], Array.from({ length: n - i }, (_, k) => n - 1 - k), i)) return;
        await heapify(arr, i, 0, i);
    }
    setCurrentStep('Sorting complete!');
    setSortedIndices(Array.from({ length: n }, (_, i) => i));
};
