export const quickSort = async (arr, { updateArray, setComparisons, setSwaps, setCurrentStep, setSortedIndices }) => {
    let quickPassCounter = 0;

    const partition = async (arr, low, high, passId) => {
        const pivot = arr[high];
        let i = low - 1;
        setCurrentStep(`Partitioning around pivot ${pivot.value}`);
        for (let j = low; j < high; j++) {
            setComparisons(c => c + 1);
            if (!await updateArray(arr, [j, high, i + 1], [], passId)) return null;
            if (arr[j].value < pivot.value) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
                setSwaps(s => s + 1);
                if (!await updateArray(arr, [i, j], [], passId)) return null;
            }
        }
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        setSwaps(s => s + 1);
        if (!await updateArray(arr, [i + 1, high], [], passId)) return null;
        return i + 1;
    };

    const sort = async (arr, low, high) => {
        if (low < high) {
            quickPassCounter++;
            const pi = await partition(arr, low, high, quickPassCounter);
            if (pi === null) return;
            await sort(arr, low, pi - 1);
            await sort(arr, pi + 1, high);
        } else if (low === high) {
            setSortedIndices(prev => [...prev, low]);
        }
    };

    await sort(arr, 0, arr.length - 1);
    setSortedIndices(Array.from({ length: arr.length }, (_, i) => i));
    setCurrentStep('Sorting complete!');
};
