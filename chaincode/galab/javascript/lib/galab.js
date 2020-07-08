/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class Galab extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const reports = ['P2020106380'];
        const certificates = [
            {
                sample: '2020106866',
                client: 'Hempi Seeders',
                order: 'Herr Jantzen',
                lot: 'LDF5236954756DFA',
            },
        ];

        for (let i = 0; i < certificates.length; i++) {
            certificates[i].docType = 'certificate';
            await ctx.stub.putState(reports[i], Buffer.from(JSON.stringify(certificates[i])));
            console.info('Added ', reports[i], ' <--> ', certificates[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryCertificate(ctx, certificateNumber) {
        const certificateAsBytes = await ctx.stub.getState(certificateNumber); // get the certificate from chaincode state
        if (!certificateAsBytes || certificateAsBytes.length === 0) {
            throw new Error(`${certificateNumber} does not exist`);
        }
        console.log(certificateAsBytes.toString());
        return certificateAsBytes.toString();
    }

    async createCertificate(ctx, certificateNumber, client, order, sample, lot) {
        console.info('============= START : Create Certificate ===========');

        const certificate = {
            sample,
            docType: 'certificate',
            client,
            order,
            lot,
        };

        await ctx.stub.putState(certificateNumber, Buffer.from(JSON.stringify(certificate)));
        console.info('============= END : Create Certificate ===========');
    }

    async queryAllCertificates(ctx) {
        const startKey = 'P2020106380';
        const endKey = 'P2020106380';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
    }

    async changeCertificateOwner(ctx, certificateNumber, newOwner) {
        console.info('============= START : changeCertificateOwner ===========');

        const certificateAsBytes = await ctx.stub.getState(certificateNumber); // get the certificate from chaincode state
        if (!certificateAsBytes || certificateAsBytes.length === 0) {
            throw new Error(`${certificateNumber} does not exist`);
        }
        const certificate = JSON.parse(certificateAsBytes.toString());
        certificate.client = newOwner;

        await ctx.stub.putState(certificateNumber, Buffer.from(JSON.stringify(certificate)));
        console.info('============= END : changeCertificateOwner ===========');
    }

}

module.exports = Galab;
